-- =====================================================
-- TRYOUT SYSTEM FUNCTIONS & TRIGGERS
-- =====================================================

-- =====================================================
-- 1. FUNCTION: Purchase Tryout Package
-- =====================================================
CREATE OR REPLACE FUNCTION public.purchase_tryout_package(
  p_tryout_package_id UUID,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_package_price INTEGER;
  v_user_balance INTEGER;
  v_purchase_id UUID;
  v_transaction_id UUID;
BEGIN
  -- Get package price
  SELECT price INTO v_package_price
  FROM public.tryout_packages
  WHERE id = p_tryout_package_id AND is_active = true;
  
  IF v_package_price IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Tryout package not found or inactive'
    );
  END IF;
  
  -- Check if already purchased
  IF EXISTS (
    SELECT 1 FROM public.user_tryout_purchases
    WHERE user_id = p_user_id
    AND tryout_package_id = p_tryout_package_id
    AND is_active = true
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'You have already purchased this tryout package'
    );
  END IF;
  
  -- Get user balance
  SELECT balance INTO v_user_balance
  FROM public.balances
  WHERE user_id = p_user_id;
  
  IF v_user_balance IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User balance not found'
    );
  END IF;
  
  -- Check if balance is sufficient
  IF v_user_balance < v_package_price THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Insufficient balance',
      'required', v_package_price,
      'current_balance', v_user_balance,
      'shortfall', v_package_price - v_user_balance
    );
  END IF;
  
  -- Start transaction
  -- Deduct balance
  UPDATE public.balances
  SET balance = balance - v_package_price,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Create purchase record
  INSERT INTO public.user_tryout_purchases (
    user_id,
    tryout_package_id,
    purchase_price,
    purchased_at,
    is_active
  ) VALUES (
    p_user_id,
    p_tryout_package_id,
    v_package_price,
    NOW(),
    true
  ) RETURNING id INTO v_purchase_id;
  
  -- Create transaction record
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    description,
    created_at
  ) VALUES (
    p_user_id,
    'usage',
    -v_package_price,
    'Purchase tryout package',
    NOW()
  ) RETURNING id INTO v_transaction_id;
  
  -- Update user statistics
  INSERT INTO public.user_statistics (user_id, total_tryouts_purchased)
  VALUES (p_user_id, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_tryouts_purchased = user_statistics.total_tryouts_purchased + 1,
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'message', 'Tryout package purchased successfully',
    'purchase_id', v_purchase_id,
    'transaction_id', v_transaction_id,
    'new_balance', v_user_balance - v_package_price
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Error: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. FUNCTION: Calculate Tryout Result
-- =====================================================
CREATE OR REPLACE FUNCTION public.calculate_tryout_result(
  p_session_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_tryout_package_id UUID;
  v_total_questions INTEGER;
  v_correct_answers INTEGER;
  v_wrong_answers INTEGER;
  v_unanswered INTEGER;
  v_total_score DECIMAL(10,2);
  v_max_score DECIMAL(10,2);
  v_percentage DECIMAL(5,2);
  v_passing_grade INTEGER;
  v_passed BOOLEAN;
  v_result_id UUID;
  v_rank_position INTEGER;
  v_total_participants INTEGER;
  v_percentile DECIMAL(5,2);
BEGIN
  -- Get session info
  SELECT user_id, tryout_package_id
  INTO v_user_id, v_tryout_package_id
  FROM public.user_tryout_sessions
  WHERE id = p_session_id;
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Session not found');
  END IF;
  
  -- Get total questions
  SELECT COUNT(*) INTO v_total_questions
  FROM public.questions
  WHERE tryout_package_id = v_tryout_package_id;
  
  -- Calculate scores
  SELECT
    COUNT(*) FILTER (WHERE is_correct = true) AS correct,
    COUNT(*) FILTER (WHERE is_correct = false) AS wrong,
    v_total_questions - COUNT(*) AS unanswered,
    COALESCE(SUM(points_earned), 0) AS total_score
  INTO v_correct_answers, v_wrong_answers, v_unanswered, v_total_score
  FROM public.user_answers
  WHERE user_tryout_session_id = p_session_id;
  
  -- Get max possible score
  SELECT COALESCE(SUM(points), 0) INTO v_max_score
  FROM public.questions
  WHERE tryout_package_id = v_tryout_package_id;
  
  -- Calculate percentage
  IF v_max_score > 0 THEN
    v_percentage := (v_total_score / v_max_score) * 100;
  ELSE
    v_percentage := 0;
  END IF;
  
  -- Check if passed
  SELECT passing_grade INTO v_passing_grade
  FROM public.tryout_packages
  WHERE id = v_tryout_package_id;
  
  v_passed := (v_percentage >= COALESCE(v_passing_grade, 0));
  
  -- Update session
  UPDATE public.user_tryout_sessions
  SET
    status = 'completed',
    completed_at = NOW(),
    total_score = v_total_score,
    percentage = v_percentage,
    updated_at = NOW()
  WHERE id = p_session_id;
  
  -- Insert result
  INSERT INTO public.tryout_results (
    user_tryout_session_id,
    user_id,
    tryout_package_id,
    total_score,
    max_score,
    percentage,
    correct_answers,
    wrong_answers,
    unanswered,
    passed,
    created_at
  ) VALUES (
    p_session_id,
    v_user_id,
    v_tryout_package_id,
    v_total_score,
    v_max_score,
    v_percentage,
    v_correct_answers,
    v_wrong_answers,
    v_unanswered,
    v_passed,
    NOW()
  ) RETURNING id INTO v_result_id;
  
  -- Calculate ranking
  SELECT COUNT(*) + 1 INTO v_rank_position
  FROM public.tryout_results
  WHERE tryout_package_id = v_tryout_package_id
  AND total_score > v_total_score;
  
  SELECT COUNT(*) INTO v_total_participants
  FROM public.tryout_results
  WHERE tryout_package_id = v_tryout_package_id;
  
  IF v_total_participants > 0 THEN
    v_percentile := ((v_total_participants - v_rank_position + 1)::DECIMAL / v_total_participants) * 100;
  ELSE
    v_percentile := 100;
  END IF;
  
  -- Update result with ranking
  UPDATE public.tryout_results
  SET
    rank_position = v_rank_position,
    total_participants = v_total_participants,
    percentile = v_percentile
  WHERE id = v_result_id;
  
  -- Insert into rankings table
  INSERT INTO public.rankings (
    user_id,
    tryout_package_id,
    tryout_result_id,
    score,
    rank_position,
    percentile,
    created_at
  ) VALUES (
    v_user_id,
    v_tryout_package_id,
    v_result_id,
    v_total_score,
    v_rank_position,
    v_percentile,
    NOW()
  );
  
  -- Update user statistics
  INSERT INTO public.user_statistics (
    user_id,
    total_tryouts_completed,
    average_score,
    best_score,
    worst_score,
    total_correct_answers,
    total_wrong_answers,
    total_unanswered,
    last_tryout_at
  ) VALUES (
    v_user_id,
    1,
    v_percentage,
    v_percentage,
    v_percentage,
    v_correct_answers,
    v_wrong_answers,
    v_unanswered,
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_tryouts_completed = user_statistics.total_tryouts_completed + 1,
    average_score = (
      (user_statistics.average_score * user_statistics.total_tryouts_completed + v_percentage) /
      (user_statistics.total_tryouts_completed + 1)
    ),
    best_score = GREATEST(user_statistics.best_score, v_percentage),
    worst_score = CASE
      WHEN user_statistics.worst_score IS NULL THEN v_percentage
      ELSE LEAST(user_statistics.worst_score, v_percentage)
    END,
    total_correct_answers = user_statistics.total_correct_answers + v_correct_answers,
    total_wrong_answers = user_statistics.total_wrong_answers + v_wrong_answers,
    total_unanswered = user_statistics.total_unanswered + v_unanswered,
    last_tryout_at = NOW(),
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'result_id', v_result_id,
    'total_score', v_total_score,
    'max_score', v_max_score,
    'percentage', v_percentage,
    'correct_answers', v_correct_answers,
    'wrong_answers', v_wrong_answers,
    'unanswered', v_unanswered,
    'passed', v_passed,
    'rank_position', v_rank_position,
    'total_participants', v_total_participants,
    'percentile', v_percentile
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Error: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. TRIGGER: Auto-update timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tryout_packages_updated_at
  BEFORE UPDATE ON public.tryout_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON public.user_tryout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

