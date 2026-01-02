export async function uploadImage(file: File, token?: string) {
    const formData = new FormData();
    formData.append("image", file); // key should match backend (usually "image" or "file")
  
    return serverFetch<{
      success: boolean;
      message: string;
      url: string;
    }>("https://codrivals.ltd/api/general/upload", {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
        // ❌ DO NOT set Content-Type when using FormData
      },
      body: formData
    });
  }
  