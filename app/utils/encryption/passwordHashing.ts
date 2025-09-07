import * as bcrypt from "bcryptjs";

const saltRound = Number(process.env.SALT_ROUND) || 10;

const generateSalt = async (salt: number) => {
  return bcrypt.genSalt(salt);
};

const hashPassword = async (password: string) => {
  const salt = await generateSalt(saltRound);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const comparePassword = async (password: string, hashedPassword: string) => {
  const passwordMatch = await bcrypt.compare(password, hashedPassword);
  return passwordMatch;
};

export { hashPassword, comparePassword };
