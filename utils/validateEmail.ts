export default function validateEmail(email: string) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}
