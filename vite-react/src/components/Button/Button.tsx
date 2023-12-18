interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button = ({ children, onClick }: ButtonProps) => {
  return (
    <button className="p-1 px-2 text-white bg-blue-500 rounded hover:bg-blue-400" onClick={onClick}>
      {children}
    </button>
  );
};
