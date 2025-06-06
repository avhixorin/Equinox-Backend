import { userInterface, UserService } from "../../services/user"

const queries = {
    getUserToken: async (_: any, payload: userInterface) => {
        const token = await UserService.getUserToken(payload);
        return token;
    },
    getCurrentLoggedInUser: async (_: any, pay: any, context: any) => {
        console.log(context)
        if (context && context.user) {
            const id = context.user.id;
            const user = await UserService.getUserById(id);
            return user;
        }
        throw ("dont know who you are!")
    }
}


const mutations = {
    createUser: async (_: any, payload: userInterface) => {
        await UserService.createUser(payload);
        const jwtToken = await UserService.getUserToken(payload);
        return jwtToken
    }
}

export const resolvers = { queries, mutations }