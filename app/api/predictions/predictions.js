// pages/api/predictions.js
import Replicate from "replicate";

// 初始化 Replicate 客户端
// 它会自动从 process.env.REPLICATE_API_TOKEN 读取密钥
const replicate = new Replicate();

export default async function handler(req, res) {
  // 我们只接受 POST 请求
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { swap_image, target_video } = req.body;

    // 检查输入是否齐全
    if (!swap_image || !target_video) {
      return res.status(400).json({ message: "Missing swap_image or target_video in request body" });
    }

    // 使用文档中提供的模型版本
    const modelVersion = "arabyai-replicate/roop_face_swap:11b6bf0f4e14d808f655e87e5448233cceff10a45f659d71539cafb7163b2e84";

    console.log("Running Replicate prediction...");
    
    // 使用强大的 replicate.run() 函数，它会等待任务完成
    const output = await replicate.run(modelVersion, {
      input: {
        swap_image,
        target_video,
      },
    });

    console.log("Prediction finished successfully:", output);

    // 将最终的结果返回给前端
    res.status(200).json(output);

  } catch (error) {
    console.error("Error running prediction:", error);
    // 从 Replicate 的错误中提取更详细的信息
    const errorDetail = error.response ? await error.response.json() : { detail: error.message };
    res.status(500).json({ message: "An error occurred during the prediction.", detail: errorDetail.detail });
  }
}
