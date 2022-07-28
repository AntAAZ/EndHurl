type mapObject = {
    name: string
    mapName: string
}

type City = mapObject & {
    point: [number, number],
    type: boolean,
    area: string,
    pop_max: number,
    countryName: string,
}

type River = mapObject & {
    coords: number[][][],
    selection: string,
}

type Country = River & { 
    countryName: string 
}

export type { City, Country, River }