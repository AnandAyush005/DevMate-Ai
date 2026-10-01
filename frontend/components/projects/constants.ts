export const fileTreeValues = [
    {
        type: 'folder',
        name: 'project',
        children : [
                {
                    type : "folder",
                    name : "src",
                    children : [
                        {
                            type : "folder",
                            name : "components",
                            children : [{ 
                                type : "file",
                                name : "Button.tsx",
                                content : "<button>Click Me</button>"
                            },{
                                type : "file",  
                                name : "Navbar.tsx",
                                content : "<nav>Navbar</nav>"
                            }]

                        },{
                            type : "file",
                            name : "page.tsx",
                            content : "<p>this is a page</p>"
                        }
                    ]
                }
            ]
    }
]