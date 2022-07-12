function Board({ name, description }) {
    return (
        <div className="rounded-md border-stone-600 border-solid border-2 p-3 pl-5 pr-8 w-full flex items-center cursor-pointer mb-2">
            <div className="grow">
                <div className="text-lg font-semibold mb-0.5">
                    {name}
                </div>
                <div className="text-sm">
                    {description}
                </div>
            </div>
            <i className="fa-solid fa-chevron-right text-2xl"></i>
        </div>
    )
}

export default Board;