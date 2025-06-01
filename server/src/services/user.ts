import { prismaClient } from "../lib/db";
import { createHmac, randomBytes } from "node:crypto";
import JWT from "jsonwebtoken";

export interface userInterface {
    email: string,
    password: string
}

const JWT_SECRET = 'k983jld@kjdjf'

export class UserService {
    private static generateHash(salt: string, password: string) {
        const hashedPassword = createHmac("sha256", salt).update(password).digest('hex');
        return hashedPassword;
    }

    public static async createUser(payload: userInterface) {
        const { email, password } = payload;
        const salt = randomBytes(32).toString('hex');
        const hashedPassword = UserService.generateHash(salt, password);

        return await prismaClient.user.create({
            data: {
                email,
                password: hashedPassword,
                salt
            }
        })
    }

    public static async getUserToken(payload: userInterface) {
        const user = await UserService.getUserByEmail(payload.email);
        if (!user) throw new Error("User does not exist");

        const userSalt = user.salt;
        const userHashPassword = UserService.generateHash(userSalt, payload.password)
        if (userHashPassword != user.password) throw new Error("wrong password");

        const token = JWT.sign({ id: user.id, email: user.email }, JWT_SECRET)
        return token;
    }

    public static decodeJwtToken(token: string) {
        return JWT.verify(token, JWT_SECRET)
    }

    public static async getUserByEmail(email: string) {
        return await prismaClient.user.findUnique({ where: { email } })
    }
    public static async getUserById(id: string) {
        return await prismaClient.user.findUnique({ where: { id } });
    }

}