import { z } from "zod"

export const createProjectFileSchema = z.object({
    name : z.string().trim().min(1, "Length of name must be greater than or equal then 1").max(100, "Length of name must be lesser than or equal to 100"),
    path : z.string().trim().min(1, "Length of path must be greater than or equal then 1").max(500, "Length of path must be lesser than or equal to 500"),
    content : z.string(),
    language : z.string().trim().min(1, "Length of language must be greater than or equal then 1").max(50, "Length of language must be lesser than or equal to 50"),
})