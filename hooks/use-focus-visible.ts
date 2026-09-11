import { useState } from 'react';

export const useFocusVisible = () => {
  const [focalise, setFocalise] = useState(false);
  return {
    focalise,
    proprietesFocus: {
      onFocus: () => setFocalise(true),
      onBlur: () => setFocalise(false),
    },
  };
};
