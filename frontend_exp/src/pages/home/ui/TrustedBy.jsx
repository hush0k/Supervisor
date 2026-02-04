export function TrustedBy({ list_company }) {
    return (
        <div className="space-y-6 flex flex-col items-center border-t border-b py-10 bg-gray-light">
            <p className="text-muted-foreground uppercase text-xs font-semibold">Нам доверяют ведущие компании</p>

            <div className="flex flex-row items-center justify-center lg:space-x-24 space-x-8 flex-wrap px-4">
                {list_company.map((logo, index) => (
                    <img
                        key={index}
                        src={logo}
                        alt={`Company ${index}`}
                        className="lg:h-24 h-16 md:h-20 grayscale opacity-70"
                    />
                ))}
            </div>
        </div>
    )
}