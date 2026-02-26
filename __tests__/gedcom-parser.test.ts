import { describe, it, expect } from 'vitest'
import { parseGedcom } from '../src/lib/gedcom-parser'

describe('GEDCOM Parser', () => {
    it('should correctly parse individuals and their metadata', () => {
        const sampleGedcom = `0 @I1@ INDI
1 NAME John /Doe/
1 SEX M
1 BIRT
2 DATE 1980
1 DEAT
2 DATE 2050
0 @I2@ INDI
1 NAME Jane /Smith/
1 SEX F
1 BIRT
2 DATE 1982`

        const result = parseGedcom(sampleGedcom)

        expect(result.individuals).toHaveLength(2)

        // Individual 1
        expect(result.individuals[0].id).toBe('@I1@')
        expect(result.individuals[0].name).toBe('John Doe')
        expect(result.individuals[0].gender).toBe('male')
        expect(result.individuals[0].birthYear).toBe(1980)
        expect(result.individuals[0].deathYear).toBe(2050)

        // Individual 2
        expect(result.individuals[1].id).toBe('@I2@')
        expect(result.individuals[1].name).toBe('Jane Smith')
        expect(result.individuals[1].gender).toBe('female')
        expect(result.individuals[1].birthYear).toBe(1982)
        expect(result.individuals[1].deathYear).toBeUndefined()
    })

    it('should correctly parse families and link structural relationships', () => {
        const sampleGedcomWithFam = `0 @I1@ INDI
1 NAME John /Doe/
0 @I2@ INDI
1 NAME Jane /Doe/
0 @I3@ INDI
1 NAME Baby /Doe/
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I3@`

        const result = parseGedcom(sampleGedcomWithFam)

        expect(result.families).toHaveLength(1)
        expect(result.families[0].husbandId).toBe('@I1@')
        expect(result.families[0].wifeId).toBe('@I2@')
        expect(result.families[0].childrenIds).toContain('@I3@')

        // Check if child is linked back to parents automatically by parser
        const baby = result.individuals.find(i => i.id === '@I3@')
        expect(baby?.fatherId).toBe('@I1@')
        expect(baby?.motherId).toBe('@I2@')
    })

    it('should ignore invalid syntax and empty lines without crashing', () => {
        const brokenGedcom = `
        
invalid line 123
0 @I99@ INDI
1 NAME Ghost /User/`

        const result = parseGedcom(brokenGedcom)
        expect(result.individuals).toHaveLength(1)
        expect(result.individuals[0].name).toBe('Ghost User')
    })
})
