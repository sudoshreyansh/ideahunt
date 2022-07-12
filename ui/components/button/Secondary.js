function SecondaryButton({value, onClick}) {
    return (
        <div className="font-semibold p-2 text-center text-stone-700 cursor-pointer" onClick={onClick}>
            {value}
        </div>
    )
}

export default SecondaryButton;