import axios from "axios";

/**
 * Create new tryout package via n8n webhook
 * @param packageData - Tryout package data
 * @returns Response data from n8n
 */
export async function createTryoutPackage(packageData: any) {
  try {
    const url = import.meta.env.VITE_N8N_CREATE_PACKAGE_URL;

    if (!url) {
      throw new Error("N8N webhook URL not configured");
    }

    const response = await axios.post(url, packageData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating tryout package:", error);
    throw error;
  }
}

/**
 * Add multiple questions to a tryout package via n8n webhook
 * @param data - Object containing tryout_package_id and questions array
 * @returns Response data from n8n
 */
export async function addQuestionsToPackage(data: any) {
  try {
    const url = import.meta.env.VITE_N8N_ADD_QUESTIONS_URL;

    if (!url) {
      throw new Error("N8N webhook URL not configured");
    }

    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error adding questions:", error);
    throw error;
  }
}

