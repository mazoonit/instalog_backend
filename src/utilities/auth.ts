import GenericError from './GenericError';
let SECRET_KEY = process.env.SECRET_KEY;
export function auth() {
  return (req: any, res: any, next: any) => {
    if (req.headers['x_secret_key'] == SECRET_KEY) {
      next();
    } else {
      throw new GenericError(401, 'You are not authorized!');
    }
  };
}
