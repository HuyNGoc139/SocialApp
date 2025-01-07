export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string) => {
  // Kiểm tra độ dài >= 6 ký tự
  if (password.length < 6) {
    return true;
  }

  // Kiểm tra mật khẩu có chứa ít nhất một ký tự thường, một ký tự viết hoa, một số, và một ký tự đặc biệt
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%*?&!.\-_<>\^~`]).{6,}$/;
  return regex.test(password);
};
export const validatePasswordLogin = (password: string): boolean => {
  // Kiểm tra độ dài >= 6 ký tự
  return password.length >= 6;
};
// Optional: Extended password validation
export const validateStrongPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  return passwordRegex.test(password);
};
export const transbyte = (num: number) => {
  const mb = (num / (1024 * 1024)).toFixed(2);
  return mb;
};
