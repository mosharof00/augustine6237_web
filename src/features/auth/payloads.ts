export function signUpBody(values: {
  name: string;
  email: string;
  password: string;
}) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password,
  };
}

export function acceptInviteBody(values: {
  token: string;
  name: string;
  password: string;
}) {
  return {
    token: values.token,
    name: values.name.trim(),
    password: values.password,
  };
}

export function schoolBody(name: string) {
  return { name: name.trim() };
}

export function resetPasswordBody(token: string, password: string) {
  return { token, password };
}
