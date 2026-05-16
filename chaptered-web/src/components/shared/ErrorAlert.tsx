interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorAlert = ({ message, onDismiss }: ErrorAlertProps) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-700 hover:text-red-900">
          ✕
        </button>
      )}
    </div>
  );
};