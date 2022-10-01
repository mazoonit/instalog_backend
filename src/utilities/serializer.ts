export default function serialize(fields: String[], data: any) {
  let obj: any = {};
  fields.map((field) => {
    if (data[field as keyof typeof data]) {
      obj[field as keyof typeof obj] = data[field as keyof typeof data];
    }
  });
  return obj;
}