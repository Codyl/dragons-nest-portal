const normalizePhoneNumber = (value: string) => {
  if (value.startsWith('+')) {
    return '+' + value.replace(/\D/g, '').slice(1, 10);
  }
  return value.replace(/\D/g, '').slice(0, 10);
};

export { normalizePhoneNumber };
