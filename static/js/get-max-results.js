function getMaxResults(period) {
    if (!period) {
        return null;
    }

    try {
        var parsed = period.match(/^(\d+)([dw])$/),
            value = Number(parsed[1]),
            unit = parsed[2];
    } catch (e) {
        return null;
    }

    switch (unit) {
        case 'w':
            return value * 7;
        case 'd':
        default:
            return value;
    }
}

export default getMaxResults;
