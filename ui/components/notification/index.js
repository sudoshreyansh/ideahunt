import PrimaryButton from "../button/Primary";

function Notification({ text, onClick }) {
    return (
        <div className="rounded bg-white p-3 px-5 w-80 mt-4 shadow-md transition-all">
            <div className="mb-4">{text}</div>
            <div className="w-14 text-xs">
                <PrimaryButton value="OK" onClick={onClick} />
            </div>
        </div>
    )
}

export default Notification;