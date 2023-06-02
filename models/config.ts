
import dotenv from "dotenv";
dotenv.config();
interface ENV{
    PORT:any
}

const env:ENV = {
    PORT: process.env.PORT || 8080
};

export default env