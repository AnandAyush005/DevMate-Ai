import "dotenv/config";
import app from "./app.ts";

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;