import { createContext, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import { useMutation } from "react-query";

import { authApi } from "../__fake-api__/auth-api";
import useAxios from "../services/useAxios";
import {
  getToken,
  getUser,
  removeUser,
  setUser,
  clearNotifications,
} from "../utils/helper";
import { enableMessaging } from "../config";

var ActionType;
(function (ActionType) {
  ActionType["INITIALIZE"] = "INITIALIZE";
  ActionType["LOGIN"] = "LOGIN";
  ActionType["LOGOUT"] = "LOGOUT";
  ActionType["REGISTER"] = "REGISTER";
})(ActionType || (ActionType = {}));

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },
  LOGIN: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
  REGISTER: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

export const AuthContext = createContext({
  ...initialState,
  platform: "JWT",
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
});

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const customInstance = useAxios();

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = getToken();

        if (accessToken) {
          const user = getUser();

          dispatch({
            type: ActionType.INITIALIZE,
            payload: {
              isAuthenticated: true,
              user,
            },
          });
        } else {
          dispatch({
            type: ActionType.INITIALIZE,
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: ActionType.INITIALIZE,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    initialize();
  }, []);

  const { mutateAsync } = useMutation(({ email, password }) =>
    customInstance.post("auth/login", { email, password })
  );

  const login = async (email, password) => {
    try {
      const { data } = await mutateAsync({ email, password });

      if (data) {
        setUser(data);
        enableMessaging();
        dispatch({
          type: ActionType.LOGIN,
          payload: {
            user: data,
          },
        });
        return data
      }
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const logout = async () => {
    removeUser();
    clearNotifications();
    dispatch({ type: ActionType.LOGOUT });
  };

  const register = async (email, name, password) => {
    const accessToken = await authApi.register({ email, name, password });
    const user = await authApi.me(accessToken);

    localStorage.setItem("accessToken", accessToken);

    dispatch({
      type: ActionType.REGISTER,
      payload: {
        user,
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        platform: "JWT",
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const AuthConsumer = AuthContext.Consumer;
