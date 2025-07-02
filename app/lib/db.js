export const users = [];

export function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}

export function addUser(user) {
  users.push(user);
}
