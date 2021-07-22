import React, { createContext } from 'react';

export const AppContext = createContext({

    signIn: async (emailAddress: string, password: string) => { },

    signOut: async () => { },

    signUp: async (data: any) => {
    },

    subScribe: async (product: any) => { }
});