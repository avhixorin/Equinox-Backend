import { userInterface, UserService } from "../../services/user"

const queries = {
    getUserToken: async (_: any, payload: userInterface) => {
        const token = await UserService.getUserToken(payload);
        return token;
    },
    getCurrentLoggedInUser: async (_: any, pay: any, context: any) => {
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
        const user = await UserService.createUser(payload);
        return "2";
    }
}

export const resolvers = { queries, mutations }