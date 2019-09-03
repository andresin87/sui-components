/* eslint-disable no-console */
import React, {useState} from 'react'
import axios from 'axios'
import {withStateValue} from '@s-ui/hoc'

import MoleculeSelect from '@s-ui/react-molecule-select'
import MoleculeAutosuggest from '../../../../../components/molecule/autosuggest/src'

import MoleculeDropdownOption from '@s-ui/react-molecule-dropdown-option'

import regions from '../data/regions.json'
import {IconArrowDown} from '../Icons/'

const MoleculeSelectWithState = withStateValue(MoleculeSelect)
const MoleculeAutosuggestWithState = withStateValue(MoleculeAutosuggest)

const getCountriesByRegion = region => {
  const url = `https://restcountries.eu/rest/v2/regionalbloc/${region}`
  return axios.get(url).then(({data}) => data)
}

const ComboCountries = () => {
  const [countries, setCountries] = useState([])

  const handleChange = (_, {value: region}) => {
    console.log({region})
    getCountriesByRegion(region)
      .then(countries =>
        countries.map(({alpha3Code: code, name}) => ({
          code,
          name
        }))
      )
      .then(setCountries)
  }

  return (
    <div style={{display: 'flex'}}>
      <div style={{width: '50%', margin: '0 10px'}}>
        <MoleculeSelectWithState
          placeholder="Select a Region..."
          onChange={handleChange}
          iconArrowDown={<IconArrowDown />}
        >
          {regions.map(({code, text}, i) => (
            <MoleculeDropdownOption key={i} value={code}>
              {text}
            </MoleculeDropdownOption>
          ))}
        </MoleculeSelectWithState>
      </div>
      <div style={{width: '50%', margin: '0 10px'}}>
        <MoleculeAutosuggestWithState
          placeholder="Select a Country..."
          onChange={(_, {value: country}) => console.log({country})}
          disabled={!countries.length}
        >
          {countries.map(({code, name}, i) => (
            <MoleculeDropdownOption key={i} value={name}>
              {name}
            </MoleculeDropdownOption>
          ))}
        </MoleculeAutosuggestWithState>
      </div>
    </div>
  )
}
export default ComboCountries
