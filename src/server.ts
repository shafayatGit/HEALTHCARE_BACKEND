import app from "./app";
import { envVars } from "./app/config/env";

// Start the server
const bootstrap = () => {
  try {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

bootstrap();
