// pages/index.js
import { useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [sourceImage, setSourceImage] = useState(null);
  const [targetVideo, setTargetVideo] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resultVideoUrl, setResultVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // 函数：将文件转换为 Base64 Data URL
  const fileToDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sourceImage || !targetVideo) {
      setError("Please select both an image and a video.");
      return;
    }

    setIsLoading(true);
    setResultVideoUrl(null);
    setError(null);

    try {
      // Replicate API 接受 Data URL 作为文件输入
      setStatusMessage("Step 1/2: Preparing files...");
      const sourceImageDataUrl = await fileToDataURL(sourceImage);
      const targetVideoDataUrl = await fileToDataURL(targetVideo);

      setStatusMessage("Step 2/2: Submitting to Replicate... (This can take 1-3 minutes)");
      
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swap_image: sourceImageDataUrl,
          target_video: targetVideoDataUrl,
        }),
      });

      const result = await response.json();
      
      if (response.status !== 200) {
        throw new Error(result.detail || "Prediction failed.");
      }
      
      setStatusMessage("Face swap complete!");
      // Replicate 的输出是一个数组，我们取第一个元素
      setResultVideoUrl(result[0]); 

    } catch (err) {
      setError(err.message);
      setStatusMessage("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>AI Face Swap Tool</title>
        <meta name="description" content="AI-powered video face swapping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>AI 视频换脸工具</h1>
        <p className={styles.description}>
          上传一张源图片和目标视频，即可体验换脸效果。
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="source-image">源图片 (包含人脸)</label>
            <input
              type="file"
              id="source-image"
              accept="image/png, image/jpeg"
              onChange={(e) => handleFileChange(e, setSourceImage)}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="target-video">目标视频</label>
            <input
              type="file"
              id="target-video"
              accept="video/mp4"
              onChange={(e) => handleFileChange(e, setTargetVideo)}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "处理中..." : "开始换脸"}
          </button>
        </form>

        {(isLoading || error || resultVideoUrl) && (
          <div className={styles.statusBox}>
            {isLoading && (
              <>
                <p>{statusMessage}</p>
                <div className={styles.loader}></div>
              </>
            )}
            {error && <p className={styles.error}>发生错误: {error}</p>}
            {resultVideoUrl && (
              <div className={styles.result}>
                <p>换脸成功！</p>
                <video controls src={resultVideoUrl}></video>
                <a href={resultVideoUrl} download="result.mp4">
                  下载视频
                </a>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
