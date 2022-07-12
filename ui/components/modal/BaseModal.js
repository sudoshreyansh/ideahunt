function Modal({ children }) {
    return (
        <div className="fixed inset-0">
            <div className="bg-black inset-0 absolute opacity-50"></div>
            <div className="bg-white absolute w-1/2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-6">
                {children}
            </div>
        </div>
    )
}

export default Modal;