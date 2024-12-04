import NavBar from "./Navbar"

function Template({use_height , use_me_bg , children }) {
    if (use_height === undefined) {
        use_height = true
    }
    if (use_me_bg === undefined) {
        use_me_bg = '#ABC4AB'
    }
    return (
        <>
            <div className="wrapper">
                <NavBar />

                <div className="content-wrapper " style={{height: use_height ? '92vh' : 'auto'}}>
                    <section className="content h-100" style={{background: use_me_bg}}>
                        {children}
                    </section>
                </div>
            </div>
        </>
    )
}

export default Template