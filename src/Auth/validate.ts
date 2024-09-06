
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };
  
  // Optional: Extended password validation
  export const validateStrongPassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
    return passwordRegex.test(password);
  };
  export const transbyte=(num:number)=>{
    const mb = (num / (1024 * 1024)).toFixed(2);
    return mb
  }
  