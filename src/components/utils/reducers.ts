export const initialState: LoginState = {
  isLoading: true,
  isSignedOut: false,
  isSignedUp: false,
  noAccount: false,
  isSignedIn: false,
  userToken: null
};

export interface LoginState {

  isLoading: boolean,
  isSignedOut: boolean,
  isSignedUp: boolean,
  noAccount: boolean,
  isSignedIn: boolean,
  userToken:any
};

export interface LoginAction {
  type: string
  token: string
}

export function LoginReducer(state: LoginState, action: any): LoginState {

  switch (action.type) {
    case 'TO_SIGNUP_PAGE':
      return {
        ...state,
        isLoading: false,
        isSignedUp: false,
        noAccount: true,
      };
    case 'TO_SIGNIN_PAGE':
      return {
        ...state,
        isLoading: false,
        isSignedIn: false,
        noAccount: false,
      };
    case 'RESTORE_TOKEN':
      return {
        ...state,
        userToken: action.token,
        isLoading: false,
      };
    case 'SIGNED_UP':
      return {
        ...state,
        isSignedIn: true,
        isSignedUp: true,
        isLoading: false,
        userToken: action.token,
      };
    case 'SIGNED_IN':
      return {
        ...state,
        isSignedOut: false,
        isSignedIn: true,
        isSignedUp: true,
        userToken: action.token,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isSignedOut: true,
        isSignedIn:false,
        isSignedUp:true
      };
  }

  return state;
};