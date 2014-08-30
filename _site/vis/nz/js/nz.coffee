theHousehold =
    income: 60000
    hours: 30
    partner: 'single'
    partner_income: 0
    partner_hours: 20
    children:[0,1,14]
    baby_bonus: 'current_credit',
    combined_income: ->
        if @partner=='single'
            @income
        else
            @income + @partner_income
       

# http://www.ird.govt.nz/how-to/taxrates-codes/itaxsalaryandwage-incometaxrates.html
tax = (taxable) ->
  if taxable < 14000
    0.105 * taxable
  else if taxable < 48000
    1470 + 0.175 * (taxable - 14000)
  else if taxable < 70000
    7420 + 0.3 * (taxable - 48000)
  else
    14020 + 0.33 * (taxable - 70000)
   
# http://www.ird.govt.nz/income-tax-individual/different-income-taxed/salaries-wages/acc/   
acc = (taxable) ->
    if taxable <= 118191
        0.0145 * taxable
    else 
        1713.76
   
# we should replicate the table at http://www.workingforfamilies.govt.nz/tax-credits/
#               http://www.workingforfamilies.govt.nz/tax-credits/payment-table.html
max_family_tax_credit = (children) ->
    if children.length == 0
        return 0
    credit = 0 
    #children.sort().reverse()
    children.sort (a,b) -> a < b
    oldest = children[0]
   
    # the oldest first
    if oldest >= 16
        credit += 101.98
    else if oldest >= 13
        credit += 92.73
    else if oldest <= 12
        credit += 92.73

    # the rest of the children
    for age in children[1..]
        if age >= 16
            credit += 91.25
        else if age >= 13
            credit += 73.5
        else if age <= 12
            credit += 64.44
   
    credit

family_tax_credit = (household) ->
    max_credit = 52 * max_family_tax_credit(household.children)
    if max_credit <= 0
        return 0
    else if household.combined_income() < 36350
        max_credit
    else 
        Math.max 0, max_credit - 0.2125 * (household.combined_income() - 36350)

   
max_in_work_tax_credit = (household) ->
    credit = 0
    # if household works enough hours
    if (household.partner == 'single' and household.hours >= 20) or (household.partner == 'couple' and household.hours+household.partner_hours >= 30)    
        if household.children.length > 0
            credit += 60
        if household.children.length > 3
            credit += 15 * (household.children.length - 3)      
    credit

   
# apply family_tax_credit and then in_work_tax_credit
in_work_tax_credit = (household) ->
    max_credit = 52 * max_in_work_tax_credit(household)
    if max_credit <= 0
        return 0
    else if family_tax_credit(household) <= 0
        threshold = 36350 + 52 * max_family_tax_credit(household.children)/0.2125
        Math.max 0, max_credit - 0.2125 * (household.combined_income() - threshold)
    else
        max_credit 
   
   
parental_tax_credit = (household) ->
    max_credit = 150 * 8 * (age for age in household.children when age <1).length
    max_credit
#    if in_work_tax_credit(household) <= 0
#        threshold = 36350 + 52 * max_in_work_tax_credit(household)/0.2125
#        Math.max 0, max_credit - 0.2125 * (household.combined_income() - threshold)
#    else
#        max_credit
# TODO I believe this does abate   

new_parental_tax_credit = (household) ->
    max_credit = 220 * 10 * (age for age in household.children when age <1).length
    family_threshold = 36350 + 52 * max_family_tax_credit(household.children)/0.2125
    in_work_threshold = family_threshold + 52 * max_in_work_tax_credit(household)/0.2125
    if max_credit <= 0
        return 0
    else if in_work_tax_credit(household) <= 0
        Math.max 0, max_credit - 0.2125 * (household.combined_income() - in_work_threshold)
    else
        max_credit

   
# https://www.labour.org.nz/beststart
best_start = (household) ->
    max_credit = 60 * 52
    family_threshold = 36350 + 52 * max_family_tax_credit(household.children)/0.2125
    in_work_threshold = family_threshold + 52 * max_in_work_tax_credit(household)/0.2125
    if (age for age in household.children when age < 1).length > 0 and household.combined_income() <= 150000
        max_credit
    else if (age for age in household.children when age < 3).length > 0 and household.combined_income() < 50000
        max_credit
    else if (age for age in household.children when age < 3).length > 0 and household.combined_income() < in_work_threshold
        Math.max 0, max_credit - (0.3 - 0.2125) * (household.combined_income() - 50000)
    else if (age for age in household.children when age < 3).length > 0
        Math.max 0, max_credit - (0.3 - 0.2125) * (in_work_threshold - 50000) - 0.3 * (household.combined_income() - in_work_threshold)
    else
        0


total_credits = (household) ->
    if household.baby_bonus == 'current_credit'
        parental_tax_credit(household) + family_tax_credit(household) + in_work_tax_credit(household)
    else if household.baby_bonus == 'best_start'
        best_start(household)  + family_tax_credit(household) + in_work_tax_credit(household)  
    else if household.baby_bonus == 'new_credit'
        new_parental_tax_credit(household)  + family_tax_credit(household) + in_work_tax_credit(household)  

       
net_income = (household) ->
    you : household.income - tax(household.income) - acc(household.income) + total_credits(household)
    partner : household.partner_income - tax(household.partner_income) - acc(household.partner_income) + total_credits(household)
   
# effective   
marginal_tax_rate = (household) ->
    current = net_income(household).you
    household.income += 1
   
    additional = net_income(household).you
    household.income -= 1
   
    you = 100*(1-additional + current)
   
    current = net_income(household).partner
    household.partner_income += 1
   
    additional = net_income(household).partner
    household.partner_income -= 1
   
    partner = 100*(1-additional + current)
   
    you: you
    partner: partner
   
   
average_tax_rate = (household) ->
    you:  100 - 100*net_income(household).you/household.income
    partner:  100 - 100*net_income(household).partner/household.partner_income