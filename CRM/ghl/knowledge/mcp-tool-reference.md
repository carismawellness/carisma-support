# GHL MCP Tool Reference

All tools are available via the `mcp__ghl__*` namespace. Use ToolSearch to load schemas before calling.

---

## Contacts

| Tool | Description |
|------|-------------|
| `mcp__ghl__search_contacts` | Search contacts by query string, email, phone |
| `mcp__ghl__get_contact` | Get single contact by ID |
| `mcp__ghl__create_contact` | Create new contact |
| `mcp__ghl__update_contact` | Update contact fields |
| `mcp__ghl__upsert_contact` | Create or update by email/phone match |
| `mcp__ghl__delete_contact` | Delete a contact |
| `mcp__ghl__get_duplicate_contact` | Find duplicate contact by email/phone |
| `mcp__ghl__bulk_update_contact_business` | Bulk assign contacts to a business |
| `mcp__ghl__bulk_update_contact_tags` | Bulk add/remove tags on multiple contacts |
| `mcp__ghl__get_contacts_by_business` | List contacts under a business |
| `mcp__ghl__verify_email` | Verify if a contact email is valid |
| `mcp__ghl__add_contact_tags` | Add tags to a contact |
| `mcp__ghl__remove_contact_tags` | Remove tags from a contact |
| `mcp__ghl__add_contact_followers` | Add followers (users) to a contact |
| `mcp__ghl__remove_contact_followers` | Remove followers from a contact |
| `mcp__ghl__add_contact_to_campaign` | Enroll contact in a campaign |
| `mcp__ghl__remove_contact_from_campaign` | Remove contact from a campaign |
| `mcp__ghl__remove_contact_from_all_campaigns` | Remove contact from ALL campaigns |
| `mcp__ghl__add_contact_to_workflow` | Add contact to a workflow |
| `mcp__ghl__remove_contact_from_workflow` | Remove contact from a workflow |

## Contact Notes

| Tool | Description |
|------|-------------|
| `mcp__ghl__create_contact_note` | Add a note to a contact |
| `mcp__ghl__get_contact_note` | Get a specific note |
| `mcp__ghl__get_contact_notes` | List all notes for a contact |
| `mcp__ghl__update_contact_note` | Update a note |
| `mcp__ghl__delete_contact_note` | Delete a note |

## Contact Tasks

| Tool | Description |
|------|-------------|
| `mcp__ghl__create_contact_task` | Create a task on a contact |
| `mcp__ghl__get_contact_task` | Get a specific task |
| `mcp__ghl__get_contact_tasks` | List all tasks for a contact |
| `mcp__ghl__update_contact_task` | Update task fields |
| `mcp__ghl__delete_contact_task` | Delete a task |
| `mcp__ghl__update_task_completion` | Mark task complete/incomplete |
| `mcp__ghl__search_location_tasks` | Search tasks across a location |

## Opportunities (Pipeline)

| Tool | Description |
|------|-------------|
| `mcp__ghl__create_opportunity` | Create new opportunity in pipeline |
| `mcp__ghl__get_opportunity` | Get opportunity by ID |
| `mcp__ghl__search_opportunities` | Search/filter opportunities |
| `mcp__ghl__upsert_opportunity` | Create or update opportunity |
| `mcp__ghl__update_opportunity` | Update opportunity fields |
| `mcp__ghl__update_opportunity_status` | Change opportunity status (open/won/lost/abandoned) |
| `mcp__ghl__delete_opportunity` | Delete an opportunity |
| `mcp__ghl__get_pipelines` | List all pipelines and their stages |
| `mcp__ghl__add_opportunity_followers` | Add followers to an opportunity |
| `mcp__ghl__remove_opportunity_followers` | Remove followers from an opportunity |

## Conversations & Messages

| Tool | Description |
|------|-------------|
| `mcp__ghl__create_conversation` | Create a new conversation thread |
| `mcp__ghl__get_conversation` | Get conversation by ID |
| `mcp__ghl__search_conversations` | Search conversations |
| `mcp__ghl__update_conversation` | Update conversation (mark read, assign, etc.) |
| `mcp__ghl__delete_conversation` | Delete a conversation |
| `mcp__ghl__get_recent_messages` | Get recent messages in a conversation |
| `mcp__ghl__get_message` | Get a single message by ID |
| `mcp__ghl__get_email_message` | Get an email message |
| `mcp__ghl__send_sms` | Send SMS to a contact |
| `mcp__ghl__send_email` | Send email to a contact |
| `mcp__ghl__add_inbound_message` | Log an inbound message |
| `mcp__ghl__add_outbound_call` | Log an outbound call |
| `mcp__ghl__cancel_scheduled_message` | Cancel a scheduled message |
| `mcp__ghl__cancel_scheduled_email` | Cancel a scheduled email |
| `mcp__ghl__update_message_status` | Update message status (read/unread) |
| `mcp__ghl__live_chat_typing` | Send typing indicator in live chat |
| `mcp__ghl__upload_message_attachments` | Upload file attachment for message |
| `mcp__ghl__get_message_recording` | Get call recording for a message |
| `mcp__ghl__get_message_transcription` | Get call transcription |
| `mcp__ghl__download_transcription` | Download transcription file |

## Calendars & Appointments

| Tool | Description |
|------|-------------|
| `mcp__ghl__get_calendars` | List all calendars |
| `mcp__ghl__get_calendar` | Get calendar by ID |
| `mcp__ghl__create_calendar` | Create a new calendar |
| `mcp__ghl__update_calendar` | Update calendar settings |
| `mcp__ghl__delete_calendar` | Delete a calendar |
| `mcp__ghl__get_calendar_groups` | List calendar groups |
| `mcp__ghl__create_calendar_group` | Create a calendar group |
| `mcp__ghl__update_calendar_group` | Update a calendar group |
| `mcp__ghl__delete_calendar_group` | Delete a calendar group |
| `mcp__ghl__disable_calendar_group` | Disable a calendar group |
| `mcp__ghl__validate_group_slug` | Check if group slug is available |
| `mcp__ghl__get_free_slots` | Get available booking slots |
| `mcp__ghl__get_blocked_slots` | Get blocked time slots |
| `mcp__ghl__create_appointment` | Book an appointment |
| `mcp__ghl__get_appointment` | Get appointment by ID |
| `mcp__ghl__update_appointment` | Update appointment details |
| `mcp__ghl__delete_appointment` | Cancel/delete appointment |
| `mcp__ghl__get_contact_appointments` | List appointments for a contact |
| `mcp__ghl__get_calendar_events` | List all calendar events |
| `mcp__ghl__create_block_slot` | Block out a time slot |
| `mcp__ghl__update_block_slot` | Update a blocked slot |
| `mcp__ghl__get_appointment_notes` | Get notes on an appointment |
| `mcp__ghl__create_appointment_note` | Add note to appointment |
| `mcp__ghl__update_appointment_note` | Update appointment note |
| `mcp__ghl__delete_appointment_note` | Delete appointment note |
| `mcp__ghl__get_timezones` | List available timezones |
| `mcp__ghl__get_calendar_notifications` | Get calendar notification settings |
| `mcp__ghl__create_calendar_notifications` | Create calendar notifications |
| `mcp__ghl__update_calendar_notification` | Update a notification |
| `mcp__ghl__delete_calendar_notification` | Delete a notification |
| `mcp__ghl__get_calendar_notification` | Get a specific notification |
| `mcp__ghl__get_calendar_resources_rooms` | List room resources |
| `mcp__ghl__get_calendar_resources_equipments` | List equipment resources |
| `mcp__ghl__create_calendar_resource_room` | Create a room resource |
| `mcp__ghl__create_calendar_resource_equipment` | Create equipment resource |
| `mcp__ghl__update_calendar_resource_room` | Update room resource |
| `mcp__ghl__update_calendar_resource_equipment` | Update equipment resource |
| `mcp__ghl__delete_calendar_resource_room` | Delete room resource |
| `mcp__ghl__delete_calendar_resource_equipment` | Delete equipment resource |
| `mcp__ghl__get_calendar_resource_room` | Get a room resource |
| `mcp__ghl__get_calendar_resource_equipment` | Get an equipment resource |

## Location (Sub-account) Management

| Tool | Description |
|------|-------------|
| `mcp__ghl__get_location` | Get location/sub-account details |
| `mcp__ghl__search_locations` | Search locations (agency level) |
| `mcp__ghl__create_location` | Create a new sub-account |
| `mcp__ghl__update_location` | Update location settings |
| `mcp__ghl__delete_location` | Delete a location |
| `mcp__ghl__get_location_tags` | List all tags in a location |
| `mcp__ghl__get_location_tag` | Get a specific tag |
| `mcp__ghl__create_location_tag` | Create a new tag |
| `mcp__ghl__update_location_tag` | Update a tag |
| `mcp__ghl__delete_location_tag` | Delete a tag |
| `mcp__ghl__get_location_custom_fields` | List all custom fields |
| `mcp__ghl__get_location_custom_field` | Get a specific custom field |
| `mcp__ghl__create_location_custom_field` | Create a custom field |
| `mcp__ghl__update_location_custom_field` | Update a custom field |
| `mcp__ghl__delete_location_custom_field` | Delete a custom field |
| `mcp__ghl__get_location_custom_values` | List custom values (dropdown options) |
| `mcp__ghl__get_location_custom_value` | Get a custom value |
| `mcp__ghl__create_location_custom_value` | Create a custom value |
| `mcp__ghl__update_location_custom_value` | Update a custom value |
| `mcp__ghl__delete_location_custom_value` | Delete a custom value |
| `mcp__ghl__get_location_templates` | List email/SMS templates |
| `mcp__ghl__delete_location_template` | Delete a template |
| `mcp__ghl__get_timezones` | Get supported timezones |
| `mcp__ghl__get_platform_accounts` | Get platform/agency accounts |
| `mcp__ghl__set_csv_accounts` | Configure CSV import accounts |
| `mcp__ghl__get_csv_upload_status` | Check CSV import status |

## Custom Fields (Advanced)

| Tool | Description |
|------|-------------|
| `mcp__ghl__ghl_create_custom_field` | Create custom field (newer endpoint) |
| `mcp__ghl__ghl_update_custom_field` | Update custom field |
| `mcp__ghl__ghl_delete_custom_field` | Delete custom field |
| `mcp__ghl__ghl_get_custom_field_by_id` | Get custom field by ID |
| `mcp__ghl__ghl_get_custom_fields_by_object_key` | Get fields by object type |
| `mcp__ghl__ghl_create_custom_field_folder` | Create custom field folder/group |
| `mcp__ghl__ghl_update_custom_field_folder` | Update custom field folder |
| `mcp__ghl__ghl_delete_custom_field_folder` | Delete custom field folder |

## Workflows & Automation

| Tool | Description |
|------|-------------|
| `mcp__ghl__ghl_get_workflows` | List all workflows in a location |
| `mcp__ghl__ghl_get_surveys` | List all surveys |
| `mcp__ghl__ghl_get_survey_submissions` | Get survey submission data |
| `mcp__ghl__get_email_campaigns` | List email campaigns |
| `mcp__ghl__get_email_templates` | List email templates |
| `mcp__ghl__create_email_template` | Create an email template |
| `mcp__ghl__update_email_template` | Update email template |
| `mcp__ghl__delete_email_template` | Delete email template |

## Blog

| Tool | Description |
|------|-------------|
| `mcp__ghl__get_blog_sites` | List blog sites |
| `mcp__ghl__get_blog_posts` | List blog posts |
| `mcp__ghl__create_blog_post` | Create a blog post |
| `mcp__ghl__update_blog_post` | Update a blog post |
| `mcp__ghl__get_blog_authors` | List blog authors |
| `mcp__ghl__get_blog_categories` | List blog categories |
| `mcp__ghl__check_url_slug` | Check if URL slug is available |

## Social Media

| Tool | Description |
|------|-------------|
| `mcp__ghl__get_social_accounts` | List connected social accounts |
| `mcp__ghl__delete_social_account` | Disconnect a social account |
| `mcp__ghl__start_social_oauth` | Start OAuth flow for social |
| `mcp__ghl__create_social_post` | Create/schedule a social post |
| `mcp__ghl__get_social_post` | Get a social post |
| `mcp__ghl__update_social_post` | Update a social post |
| `mcp__ghl__delete_social_post` | Delete a social post |
| `mcp__ghl__bulk_delete_social_posts` | Bulk delete social posts |
| `mcp__ghl__search_social_posts` | Search social posts |
| `mcp__ghl__upload_social_csv` | Upload CSV for bulk social posts |
| `mcp__ghl__get_social_categories` | List social post categories |
| `mcp__ghl__get_social_category` | Get a specific category |
| `mcp__ghl__get_social_tags` | List social tags |
| `mcp__ghl__get_social_tags_by_ids` | Get social tags by IDs |

## Products & E-commerce

| Tool | Description |
|------|-------------|
| `mcp__ghl__ghl_list_products` | List products |
| `mcp__ghl__ghl_get_product` | Get product by ID |
| `mcp__ghl__ghl_create_product` | Create a product |
| `mcp__ghl__ghl_update_product` | Update a product |
| `mcp__ghl__ghl_delete_product` | Delete a product |
| `mcp__ghl__ghl_list_prices` | List prices for a product |
| `mcp__ghl__ghl_create_price` | Create a price option |
| `mcp__ghl__ghl_list_product_collections` | List product collections |
| `mcp__ghl__ghl_create_product_collection` | Create a product collection |
| `mcp__ghl__ghl_list_inventory` | List inventory |
| `mcp__ghl__list_orders` | List orders |
| `mcp__ghl__get_order_by_id` | Get order by ID |
| `mcp__ghl__create_order_fulfillment` | Create order fulfillment |
| `mcp__ghl__list_order_fulfillments` | List order fulfillments |
| `mcp__ghl__list_transactions` | List transactions |
| `mcp__ghl__get_transaction_by_id` | Get transaction by ID |
| `mcp__ghl__list_subscriptions` | List subscriptions |
| `mcp__ghl__get_subscription_by_id` | Get subscription by ID |
| `mcp__ghl__list_coupons` | List coupons |
| `mcp__ghl__get_coupon` | Get coupon by ID |
| `mcp__ghl__create_coupon` | Create a coupon |
| `mcp__ghl__update_coupon` | Update a coupon |
| `mcp__ghl__delete_coupon` | Delete a coupon |

## Invoicing & Payments

| Tool | Description |
|------|-------------|
| `mcp__ghl__list_invoices` | List invoices |
| `mcp__ghl__get_invoice` | Get invoice by ID |
| `mcp__ghl__create_invoice` | Create an invoice |
| `mcp__ghl__send_invoice` | Send invoice to contact |
| `mcp__ghl__generate_invoice_number` | Generate next invoice number |
| `mcp__ghl__list_invoice_templates` | List invoice templates |
| `mcp__ghl__get_invoice_template` | Get invoice template |
| `mcp__ghl__create_invoice_template` | Create invoice template |
| `mcp__ghl__update_invoice_template` | Update invoice template |
| `mcp__ghl__delete_invoice_template` | Delete invoice template |
| `mcp__ghl__list_invoice_schedules` | List recurring invoice schedules |
| `mcp__ghl__get_invoice_schedule` | Get a schedule |
| `mcp__ghl__create_invoice_schedule` | Create a recurring schedule |
| `mcp__ghl__list_estimates` | List estimates |
| `mcp__ghl__create_estimate` | Create an estimate |
| `mcp__ghl__send_estimate` | Send estimate to contact |
| `mcp__ghl__generate_estimate_number` | Generate next estimate number |
| `mcp__ghl__create_invoice_from_estimate` | Convert estimate to invoice |

## Shipping (E-commerce)

| Tool | Description |
|------|-------------|
| `mcp__ghl__ghl_list_shipping_zones` | List shipping zones |
| `mcp__ghl__ghl_create_shipping_zone` | Create shipping zone |
| `mcp__ghl__ghl_update_shipping_zone` | Update shipping zone |
| `mcp__ghl__ghl_delete_shipping_zone` | Delete shipping zone |
| `mcp__ghl__ghl_get_shipping_zone` | Get shipping zone |
| `mcp__ghl__ghl_list_shipping_carriers` | List carriers |
| `mcp__ghl__ghl_create_shipping_carrier` | Create carrier |
| `mcp__ghl__ghl_update_shipping_carrier` | Update carrier |
| `mcp__ghl__ghl_delete_shipping_carrier` | Delete carrier |
| `mcp__ghl__ghl_get_shipping_carrier` | Get carrier |
| `mcp__ghl__ghl_list_shipping_rates` | List shipping rates |
| `mcp__ghl__ghl_create_shipping_rate` | Create shipping rate |
| `mcp__ghl__ghl_update_shipping_rate` | Update shipping rate |
| `mcp__ghl__ghl_delete_shipping_rate` | Delete shipping rate |
| `mcp__ghl__ghl_get_shipping_rate` | Get shipping rate |
| `mcp__ghl__ghl_get_available_shipping_rates` | Get rates for an order |
| `mcp__ghl__ghl_create_store_setting` | Create/update store settings |
| `mcp__ghl__ghl_get_store_setting` | Get store settings |

## Custom Objects & Relations

| Tool | Description |
|------|-------------|
| `mcp__ghl__get_all_objects` | List all custom object schemas |
| `mcp__ghl__create_object_schema` | Create a custom object type |
| `mcp__ghl__get_object_schema` | Get custom object schema |
| `mcp__ghl__update_object_schema` | Update custom object schema |
| `mcp__ghl__create_object_record` | Create a record of custom object |
| `mcp__ghl__get_object_record` | Get a custom object record |
| `mcp__ghl__update_object_record` | Update a custom object record |
| `mcp__ghl__delete_object_record` | Delete a custom object record |
| `mcp__ghl__search_object_records` | Search custom object records |
| `mcp__ghl__ghl_create_association` | Create association between objects |
| `mcp__ghl__ghl_get_all_associations` | List all association definitions |
| `mcp__ghl__ghl_get_association_by_id` | Get association by ID |
| `mcp__ghl__ghl_get_association_by_key` | Get association by key |
| `mcp__ghl__ghl_get_association_by_object_key` | Get by object type key |
| `mcp__ghl__ghl_update_association` | Update an association |
| `mcp__ghl__ghl_delete_association` | Delete an association |
| `mcp__ghl__ghl_create_relation` | Create a relation between records |
| `mcp__ghl__ghl_get_relations_by_record` | Get all relations for a record |
| `mcp__ghl__ghl_delete_relation` | Delete a relation |

## Media

| Tool | Description |
|------|-------------|
| `mcp__ghl__get_media_files` | List media files |
| `mcp__ghl__upload_media_file` | Upload a media file |
| `mcp__ghl__delete_media_file` | Delete a media file |

## Integrations / Custom Providers

| Tool | Description |
|------|-------------|
| `mcp__ghl__get_custom_provider_config` | Get custom provider config |
| `mcp__ghl__create_custom_provider_config` | Create custom provider |
| `mcp__ghl__disconnect_custom_provider_config` | Disconnect custom provider |
| `mcp__ghl__create_custom_provider_integration` | Create custom integration |
| `mcp__ghl__delete_custom_provider_integration` | Delete custom integration |
| `mcp__ghl__list_whitelabel_integration_providers` | List whitelabel providers |
| `mcp__ghl__create_whitelabel_integration_provider` | Create whitelabel provider |

---

## Usage Pattern

Always load tool schemas before calling:

```python
# 1. Load the schema
ToolSearch(query="select:mcp__ghl__search_contacts")

# 2. Then call with correct parameters
mcp__ghl__search_contacts(locationId="...", query="John")
```

## Key Parameters

- **locationId** — Required on almost every tool. Set from `GHL_LOCATION_ID` env var.
- **contactId** — UUID for the contact record
- **opportunityId** — UUID for the pipeline opportunity
- **pipelineId** / **pipelineStageId** — IDs from `get_pipelines`

## Carisma Location IDs

See [carisma-setup.md](carisma-setup.md) for all location IDs, pipeline IDs, and custom field IDs.
