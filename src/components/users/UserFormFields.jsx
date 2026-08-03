import Input from '@components/ui/Input';

/**
 * UserFormFields — reusable form fields for user create/edit forms.
 * Renders firstName, lastName, email, phone fields.
 * Password is only shown on create or when explicitly requested.
 */
const UserFormFields = ({
  values   = {},
  errors   = {},
  onChange,
  disabled = false,
  isEdit   = false,
}) => {
  const handleChange = (field) => (e) => {
    onChange?.({ ...values, [field]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="Enter first name"
          value={values.firstName || ''}
          onChange={handleChange('firstName')}
          error={errors.firstName}
          disabled={disabled}
          required
        />
        <Input
          label="Last Name"
          placeholder="Enter last name"
          value={values.lastName || ''}
          onChange={handleChange('lastName')}
          error={errors.lastName}
          disabled={disabled}
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="Enter email address"
        value={values.email || ''}
        onChange={handleChange('email')}
        error={errors.email}
        disabled={disabled}
        required
      />

      <Input
        label="Phone"
        placeholder="Enter phone number"
        value={values.phone || ''}
        onChange={handleChange('phone')}
        error={errors.phone}
        disabled={disabled}
      />

      {!isEdit && (
        <Input
          label="Password"
          type="password"
          placeholder="Enter password"
          value={values.password || ''}
          onChange={handleChange('password')}
          error={errors.password}
          disabled={disabled}
          required
        />
      )}
    </div>
  );
};

export default UserFormFields;
