import { redisClient } from "@/lib/redis";
import { matchLink } from "tiktok-dl-core";

export async function GET() {
    const keys = await redisClient.keys('*');
    return Response.json({
        data: keys.filter(key => matchLink(key)),
    });
}