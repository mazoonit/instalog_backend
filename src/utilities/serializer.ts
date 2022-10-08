export function serialize(fields: String[], data: any) {
  let obj: any = {};
  fields.map((field) => {
    if (data[field as keyof typeof data]) {
      obj[field as keyof typeof obj] = data[field as keyof typeof data];
    }
  });
  return obj;
}

export function queryParser() {
  return (req: any, res: any, next: any) => {
    //just passing the query to the body to use validators and stuff
    req.body = req.query;
    next();
  };
}