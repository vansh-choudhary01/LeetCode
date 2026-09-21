import prisma from "../lib/prisma.js";

async function seedAdmin() {
    if (!process.env.ADMIN_NAME || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        throw new Error("ADMIN_NAME | ADMIN_EMAIL | ADMIN_PASSWORD, all required env isn't configured");
    }

    const existing = await prisma.user.findFirst({
        where: {
            email: process.env.ADMIN_EMAIL
        }
    });

    if (existing) {
        throw new Error(`admin is already present with ${existing.name} name`);
    }

    await prisma.user.create({
        data: {
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: 'admin'
        }
    });

    return 'admin created successfully';
}

seedAdmin()
    .then(res => console.log(res))
    .catch(err => console.error(err));