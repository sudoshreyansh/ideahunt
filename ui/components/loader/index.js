function Loader({ className }) {
    return (
        <div className={className}>
            <div className="loader">
                <div className="loader-inner-circle"></div>
            </div>
        </div>
    )
}

export default Loader;