interface IStatusCallbacks {
  onSuccess: () => void;
  onError: () => void;
}
interface IData {
  name: string;
  email: string;
  message: string;
}

type ISendEmail = (
  data: IData,
  statusCallbacks: IStatusCallbacks,
) => Promise<void>;

const useSendEmailOfContact = () => {
  const sendEmail: ISendEmail = async (
    { name, email, message },
    { onSuccess, onError },
  ) => {
    try {
      await fetch("/api/sendEmail", {
        method: "POST",
        body: JSON.stringify({
          from: { name: name, address: email },
          message: message,
          subject: "NUEVO MENTORIADO",
        }),
      });
      onSuccess();
    } catch (e) {
      onError();
    }
  };
  return {
    sendEmail,
  };
};

export default useSendEmailOfContact;
