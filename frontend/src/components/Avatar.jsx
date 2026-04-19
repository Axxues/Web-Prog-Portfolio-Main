import '../styles/Avatar.css';

function Avatar({ name, profilePic, size = 'md', className = '' }) {
  const getInitial = (fullName) => {
    return fullName?.charAt(0)?.toUpperCase() || '?';
  };

  const sizeClasses = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
  };

  if (profilePic) {
    return (
      <img
        src={profilePic}
        alt={name}
        className={`avatar avatar-image ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div className={`avatar avatar-placeholder ${sizeClasses[size]} ${className}`}>
      {getInitial(name)}
    </div>
  );
}

export default Avatar;
