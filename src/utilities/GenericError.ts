export default class GenericError {
  private httpCode: Number;
  private errorMessage: string;
  constructor(httpCode: Number, errorMessage: string) {
    this.httpCode = httpCode;
    this.errorMessage = errorMessage;
  }
  public getResponse() {
    return {
      httpCode: this.httpCode,
      errorMessage: this.errorMessage,
    };
  }
}