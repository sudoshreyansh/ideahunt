function PrimaryButton({value, onClick, deactivated}) {
    return (
        <div className={`rounded-md text-center font-semibold border-solid text-white p-2 bg-sky-600 cursor-pointer ${deactivated ? 'opacity-50': ''}`} onClick={deactivated ? () => {} : onClick}>
            {value}
        </div>
    )
}

export default PrimaryButton;