import { useDispatch, useSelector } from 'react-redux';
import { setRegisterFormData, resetRegisterForm } from './registerSlice';

export const useRegisterForm = () => {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.register.formData);

  const updateFormData = (data) => {
    dispatch(setRegisterFormData(data));
  };

  const resetForm = () => {
    dispatch(resetRegisterForm());
  };

  return { formData, updateFormData, resetForm };
};
