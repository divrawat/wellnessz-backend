import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import  mongoose from "mongoose";

import blogRoutes from "./routes/blog.js";
import authRoutes from "./routes/admin.js";
import categoryRoutes from "./routes/category.js";
import ImageRoutes from "./routes/images.js";
import clubRoutes from "./routes/club.js";

import "dotenv/config.js";
const app = express();
app.use(cors());

mongoose.set("strictQuery", true);
mongoose.connect(process.env.DATABASE, {}).then(() => console.log("DB connected")).catch((err) => console.log("DB Error => ", err));
  
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api', blogRoutes);
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', ImageRoutes);
app.use('/api/v1/club', clubRoutes);

if(process.env.NODE_ENV=== 'development'){app.use((cors({origin:`${process.env.CLIENT_URL}`})))}
app.get('/', (req, res) => {res.json("Backend of WellnessZ index");});
const port = process.env.PORT || 8000;
app.listen(port, () => {console.log(`Server is running on port ${port}`);});
    
