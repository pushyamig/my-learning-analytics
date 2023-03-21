import React from 'react'

function ResourceChartNarrative ({ data, weekRange, gradeSelection, resourceType }) {
  const unAccessedResources = data.filter(resource => resource.self_access_count === 0)
  const accessedResources = data.filter(resource => resource.self_access_count >= 1)
  const narrativeTextResources = {}
  narrativeTextResources.weekSelection = `Resources accessed from week ${weekRange[0]} to ${weekRange[1]}. `
  narrativeTextResources.typeOfResource = `Selected resource type(s) ${resourceType.length === 1 ? 'is' : 'are'} ${resourceType}. `
  narrativeTextResources.gradeFilter = gradeSelection.toUpperCase() !== 'ALL' ? `Filtering on grades ${gradeSelection}.` : 'Getting resources across all grades.'
  narrativeTextResources.resourcesUnaccessCount = `You have not yet accessed ${unAccessedResources.length} of ${data.length} resources.`
  narrativeTextResources.resourcesAccessCount = `You have accessed ${accessedResources.length} of ${data.length} resources.`
  narrativeTextResources.resourcesUnAccessList = unAccessedResources.map(x =>
    resourceType.length === 1
      ? `${x.resource_name.split('|')[1]} has been accessed by ${x.total_percent}% of students.`
      : `${x.resource_name.split('|')[1]} of type ${x.resource_type} has been accessed by ${x.total_percent}% of students.`
  )
  narrativeTextResources.resourceAccessList = accessedResources.map(x =>
    resourceType.length === 1
      ? `${x.resource_name.split('|')[1]} has been accessed by ${x.total_percent}% of students, and you accessed it ${x.self_access_count} times. The last time you accessed this resource was on ${new Date(x.self_access_last_time).toDateString()}`
      : `${x.resource_name.split('|')[1]} of type ${x.resource_type} has been accessed by ${x.total_percent}% of students, and you accessed it ${x.self_access_count} times. The last time you accessed this resource was on ${new Date(x.self_access_last_time).toDateString()}`)
  return (
    <div id='resource-view-narrative' className='fa-sr-only' aria-live='polite' aria-atomic='true'>
      <p>The following paragraphs provide a text description for the graphical bar-chart on this page:</p>
      <p>{narrativeTextResources.weekSelection}</p>
      <p>{narrativeTextResources.typeOfResource}</p>
      <p>{narrativeTextResources.gradeFilter}</p>
      <p>{narrativeTextResources.resourcesUnaccessCount}</p>
      <p id='unaccessed-resources'>List of resources you have not accessed</p>
      <ul aria-labelledby='unaccessed-resources'>
        {narrativeTextResources.resourcesUnAccessList.map((item, key) => <li key={key}>{item}</li>)}
      </ul>
      <p>{narrativeTextResources.resourcesAccessCount}</p>
      <p id='accessed-resources'>List of resources you have accessed</p>
      <ul aria-labelledby='accessed-resources'>
        {narrativeTextResources.resourceAccessList.map((item, key) => <li key={key}>{item}</li>)}
      </ul>
    </div>
  )
}

export default ResourceChartNarrative
