const formatPhoneNumber = (value: string) => {
  if (value.startsWith('+1')) {
    value = value.slice(1);
  }

  if (value.length === 0) {
    return '';
  }

  if (value.length <= 3) {
    return `(${value.slice(0, 3)}`;
  }

  if (value.length <= 6) {
    return `(${value.slice(0, 3)}) ${value.slice(3, 6)}`;
  }

  return `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
};

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString();
};

export { formatPhoneNumber, formatDate };
