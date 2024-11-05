export const isValidPassword = (
    password: string,
    target: string,
    type?: 'username' | 'email' | 'fullname',
  ) => {
    if (!type) {
      type = 'username';
    }
  
    const targetLowerCase = target?.toLowerCase();
  
    if (!password || password.length === 1) {
      return true;
    }
  
    if (type === 'username') {
      const usernamePart = [
        targetLowerCase,
        targetLowerCase.replace(/[0-9]/g, ''),
        targetLowerCase.replace(/[a-z]/g, ''),
      ];
  
      for (const part of usernamePart) {
        if (
          password.toLowerCase().includes(part) ||
          part.includes(password.toLowerCase())
        ) {
          return false;
        }
      }
  
      return true;
    } else if (type === 'email') {
      const [localPart, domainPart] = targetLowerCase.split('@');
  
      const emailPart = [targetLowerCase, localPart, domainPart];
  
      for (const part of emailPart) {
        if (
          password.toLowerCase().includes(part) ||
          part.includes(password.toLowerCase())
        ) {
          return false;
        }
      }
  
      return true;
    } else if (type === 'fullname') {
      const fullnamePart = targetLowerCase.split(' ');
  
      for (const part of fullnamePart) {
        if (
          password.toLowerCase().includes(part) ||
          part.includes(password.toLowerCase())
        ) {
          return false;
        }
      }
  
      return true;
    }
  
    return false;
  };
  