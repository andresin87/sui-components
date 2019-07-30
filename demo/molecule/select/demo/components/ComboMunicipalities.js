/* eslint-disable no-console */
import React, {useState} from 'react'
import axios from 'axios'
import {withStateValue} from '@s-ui/hoc'

import MoleculeSelect from '../../../../../components/molecule/select/src'

import MoleculeSelectOption from '@s-ui/react-molecule-dropdown-option'

import {IconArrowDown} from '../Icons/'
import provinces from '../data/provinces.json'

const MoleculeSelectWithState = withStateValue(MoleculeSelect)

const getMunicipalitiesByProvince = async province => {
  const url = `https://ptaformbuilder-classifiedads.spain.schibsted.io/fieldrules/municipality?form_id=milanuncios-filter&province=${province}`
  const {
    data: {datalist}
  } = await axios.get(url)
  return datalist
}

const ComboCountries = () => {
  const [municipalities, setMunicipalities] = useState([])

  const handleChange = async (_, {value: province}) => {
    console.log({province})
    const municipalities = await getMunicipalitiesByProvince(province)
    console.log(municipalities)
    setMunicipalities(municipalities)
  }

  return (
    <div style={{display: 'flex'}}>
      <div style={{width: '50%', margin: '0 10px'}}>
        <MoleculeSelectWithState
          placeholder="Select a Province..."
          iconArrowDown={<IconArrowDown />}
          onChange={handleChange}
        >
          {provinces.map(({value, text}, i) => (
            <MoleculeSelectOption key={i} value={value}>
              {text}
            </MoleculeSelectOption>
          ))}
        </MoleculeSelectWithState>
      </div>
      <div style={{width: '50%', margin: '0 10px'}}>
        <MoleculeSelectWithState
          placeholder="Select a Municipality..."
          onChange={(_, {value: municipality}) => console.log({municipality})}
          iconArrowDown={<IconArrowDown />}
          disabled={!municipalities.length}
        >
          {municipalities.map(({value, text}, i) => (
            <MoleculeSelectOption key={i} value={value}>
              {text}
            </MoleculeSelectOption>
          ))}
        </MoleculeSelectWithState>
      </div>
    </div>
  )
}
export default ComboCountries
